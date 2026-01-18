import MainLayout from '@/components/main-layout'
import ProfileContent from '@/components/profile/profile-content'
import ProfileHeader from '@/components/profile/profile-header'
import {
    checkFollowStatus,
    getCachedUserProfile,
    getUserTweets,
} from '@/lib/actions/profile'
import { getSession } from '@/lib/auth/auth-actions'
import { redirect } from 'next/navigation'

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const session = await getSession()
    if (!session) redirect('/sign-in')

    const resolvedParams = await params
    const username = decodeURIComponent(resolvedParams.username)

    const [profileResult, tweetsResult] = await Promise.all([
        getCachedUserProfile(username).then(async (result) => {
            if (result.success && result.user) {
                const followStatus = await checkFollowStatus(result.user.id)
                return { ...result, isFollowing: followStatus }
            }

            return { success: false, isFollowing: false, user: null }
        }),
        getUserTweets(username),
    ])

    const user = profileResult.user
    const isFollowing = profileResult.isFollowing
    const tweets = tweetsResult.success ? tweetsResult.tweets || [] : []

    if (!profileResult.success || !user) {
        return (
            <MainLayout>
                <div className='p-8 text-center'>
                    <h1 className='text-2xl font-bold text-red-500'>
                        User not found
                    </h1>
                    <p className='text-muted-foreground'>
                        The user you are looking at doesnt exist.
                    </p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <ProfileHeader
                user={user}
                currentUser={session.user}
                isFollowing={isFollowing as boolean}
                followingCount={user._count.following}
                followerCount={user._count.followers}
            />
            <ProfileContent
                username={username}
                initialTweets={tweets}
                tweetCount={user.postsCount}
                replyCount={user.repliesCount}
                likeCount={user._count.likes}
                retweetCount={user._count.retweets}
                currentUserId={session.user?.id}
            />
        </MainLayout>
    )
}
