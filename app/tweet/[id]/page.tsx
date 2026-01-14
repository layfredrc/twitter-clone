import TweetDetail from '@/components/tweet/tweet-detail'
import { getTweetById, getTweetReplies } from '@/lib/actions/tweets'
import { getSession } from '@/lib/auth/auth-actions'
import { redirect } from 'next/navigation'

export default async function TweetPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getSession()
    if (!session?.user) redirect('/sign-in')
    const paramsResoleved = await params
    const id = paramsResoleved.id

    const tweetResult = await getTweetById(id)
    if (!tweetResult.success || !tweetResult.tweet) redirect('/')

    const repliesResult = await getTweetReplies(id)
    const replies = repliesResult.replies ?? []

    return (
        <>
            <TweetDetail
                tweet={tweetResult.tweet}
                currentUserId={session.user.id}
                replies={replies}
            />
        </>
    )
}
