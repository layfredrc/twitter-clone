'use server'

import { redirect } from 'next/navigation'
import { getSession } from '../auth/auth-actions'
import { prisma } from '../prisma'

export async function getTweets() {
    try {
        const tweets = await prisma.tweet.findMany({
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

export async function getTweetReplies(tweetId: string) {
    try {
        const replies = await prisma.tweet.findMany({
            where: {
                parentId: tweetId,
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
        return { success: true, replies }
    } catch (err) {
        console.error('Error fetching tweets replies:', err)
        return { sucess: false, error: 'Failed to fetch tweets replies' }
    }
}

export async function createTweet(content: string, imageUrl?: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }
    try {
        const tweet = await prisma.tweet.create({
            data: {
                content,
                imageUrl,
                authorId: session.user.id,
            },
        })
        return { success: true, tweet }
    } catch (err) {
        console.error('Error creating tweet:', err)
        return { sucess: false, error: 'Failed to tweet' }
    }
}

export async function createReplyTweet(
    tweetId: string,
    content: string,
    imageUrl?: string
) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }
    try {
        const tweet = await prisma.tweet.create({
            data: {
                content,
                imageUrl,
                authorId: session.user.id,
                parentId: tweetId,
            },
        })
        return { success: true, tweet }
    } catch (err) {
        console.error('Error creating tweet:', err)
        return { sucess: false, error: 'Failed to tweet' }
    }
}

export async function getTweetById(tweetId: string) {
    try {
        const tweet = await prisma.tweet.findUnique({
            where: {
                id: tweetId,
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
        })

        if (!tweet) {
            return { success: false, error: 'Tweet was not found' }
        }

        return { success: true, tweet }
    } catch (err) {
        console.error('Error fetching tweets', err)
        return { success: false, error: 'Failed to fetch tweet' }
    }
}

export async function likeTweet(tweetId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }
    try {
        // check to see if user already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_tweetId: {
                    userId: session.user.id,
                    tweetId,
                },
            },
        })

        if (existingLike) {
            // unlike the tweet
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            })
            return { success: true, action: 'unliked' }
        } else {
            // like the tweet
            await prisma.like.create({
                data: {
                    userId: session.user.id,
                    tweetId,
                },
            })
            return { success: true, action: 'liked' }
        }
    } catch (err) {
        console.error('Error liking tweets:', err)
        return { success: false, error: 'Failed to like tweet' }
    }
}

export async function RTTweet(tweetId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/sign-in')
    }
    try {
        // check to see if user already rt
        const existingRetweet = await prisma.retweet.findUnique({
            where: {
                userId_tweetId: {
                    userId: session.user.id,
                    tweetId,
                },
            },
        })

        if (existingRetweet) {
            // unretweet
            await prisma.retweet.delete({
                where: {
                    id: existingRetweet.id,
                },
            })
            return { success: true, action: 'unretweeted' }
        } else {
            // retweet
            await prisma.retweet.create({
                data: {
                    userId: session.user.id,
                    tweetId,
                },
            })
            return { success: true, action: 'retweeted' }
        }
    } catch (err) {
        console.error('Error retweeting:', err)
        return { success: false, error: 'Failed to retweet' }
    }
}
