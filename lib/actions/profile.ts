'use server'

import { redirect } from 'next/navigation'
import { getSession } from '../auth/auth-actions'
import { prisma } from '../prisma'
import { unstable_cache } from 'next/cache'

export async function getUserProfile(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            include: {
                _count: {
                    select: {
                        tweets: true,
                        retweets: true,
                        likes: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const [postsCount, repliesCount] = await Promise.all([
            prisma.tweet.count({
                where: {
                    authorId: user?.id,
                    parentId: null,
                },
            }),
            prisma.tweet.count({
                where: {
                    authorId: user?.id,
                    parentId: { not: null },
                },
            }),
        ])

        return {
            success: true,
            user: {
                ...user,
                postsCount,
                repliesCount,
            },
        }
    } catch (error) {
        console.error('Error fetching user profile', error)
        return { success: false, error: 'Failed to fetch user profile' }
    }
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'twitter-clone')

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    )

    if (!response.ok) {
        throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return data.secure_url
}

export async function updateUserProfile(data: {
    name: string
    username?: string | null
    bio?: string
    avatar?: string
    banner?: string
}) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }

    try {
        if (data.username !== session.user.username) {
            const existingUser = await prisma.user.findUnique({
                where: {
                    username: data.username || undefined,
                },
            })

            if (existingUser)
                return { success: false, error: 'Username is already taken' }
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name: data.name,
                username: data.username,
                bio: data.bio,
                avatar: data.avatar,
                image: data.banner, // Using image field for banner
            },
        })

        return { success: true, user: updatedUser }
    } catch (err) {
        console.error('Error updating user profile:', err)
        return { success: false, error: 'Failed to update profile' }
    }
}

export async function followUser(userId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }

    if (session.user.id === userId) {
        return { success: false, error: 'Cannnot follow yourself' }
    }

    try {
        // check to see if user already followed
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followingId_followerId: {
                    followerId: session.user.id,
                    followingId: userId,
                },
            },
        })

        if (existingFollow) {
            // unfollow
            await prisma.follow.delete({
                where: {
                    id: existingFollow.id,
                },
            })
            return { success: true, action: 'unfollowed' }
        } else {
            // follow
            await prisma.follow.create({
                data: {
                    followerId: userId,
                    followingId: session.user.id,
                },
            })
            return { success: true, action: 'followed' }
        }
    } catch (err) {
        console.error('Error following user:', err)
        return { success: false, error: 'Failed follow user' }
    }
}

export async function checkFollowStatus(targetUserid: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }

    try {
        const follow = await prisma.follow.findUnique({
            where: {
                followingId_followerId: {
                    followerId: session.user.id,
                    followingId: targetUserid,
                },
            },
        })
        return { success: true, isFollowing: !!follow }
    } catch (err) {
        return { success: false, isFollowing: false }
    }
}

export async function getUserTweets(username: string) {
    try {
        const tweets = await prisma.tweet.findMany({
            where: {
                author: {
                    username,
                },
                parentId: null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                likes: true,
                retweets: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return { success: true, tweets }
    } catch (err) {
        console.error('Error fetching tweets:', err)
        return { sucess: false, error: 'Failed to fetch tweets' }
    }
}

export const getCachedUserReplies = unstable_cache(
    async (username: string) => {
        try {
            const tweets = await prisma.tweet.findMany({
                where: {
                    author: {
                        username,
                    },
                    parentId: { not: null },
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    likes: true,
                    retweets: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            return { success: true, tweets }
        } catch (err) {
            console.error('Error fetching tweets:', err)
            return { success: false, error: 'Failed to fetch tweets' }
        }
    },
    ['user-replies'],
    { revalidate: 300, tags: ['user-replies'] }
)

export async function getUserReplies(username: string) {
    return getCachedUserReplies(username)
}

export const getCachedUserLikes = unstable_cache(
    async (username: string) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username,
                },
                select: { id: true },
            })

            if (!user) {
                return { success: false, error: 'User not found' }
            }

            const likedTweets = await prisma.like.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    tweet: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                            likes: true,
                            retweets: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            return {
                success: true,
                tweets: likedTweets.map((like) => like.tweet),
            }
        } catch (err) {
            console.error('Error fetching tweets:', err)
            return { success: false, error: 'Failed to fetch tweets' }
        }
    },
    ['user-likes'],
    { revalidate: 300, tags: ['user-likes'] }
)

export async function getUserLikes(username: string) {
    return getCachedUserLikes(username)
}

export const getCachedUserRetweets = unstable_cache(
    async (username: string) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username,
                },
                select: { id: true },
            })

            if (!user) {
                return { success: false, error: 'User not found' }
            }

            const retweetedTweets = await prisma.retweet.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    tweet: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                            likes: true,
                            retweets: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })

            return {
                success: true,
                tweets: retweetedTweets.map((retweet) => retweet.tweet),
            }
        } catch (err) {
            console.error('Error fetching tweets:', err)
            return { success: false, error: 'Failed to fetch tweets' }
        }
    },
    ['user-retweets'],
    { revalidate: 300, tags: ['user-retweets'] }
)

export async function getUserRetweets(username: string) {
    return getCachedUserRetweets(username)
}
