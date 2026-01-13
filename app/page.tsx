import MainLayout from '@/components/main-layout'
import Tweet from '@/components/tweet'
import TweetComposer from '@/components/tweet/tweet-composer'
import { Button } from '@/components/ui/button'
import { getTweets } from '@/lib/actions/tweets'
import { getSession, signOut } from '@/lib/auth/auth-actions'

export default async function Home() {
    const tweetsResult = await getTweets()
    const tweets = tweetsResult.success ? tweetsResult.tweets || [] : []
    const session = await getSession()
    return (
        <MainLayout>
            <div className='border-b border-border'>
                <div className='p-4'>
                    <h1 className='text-xl font-bold'>Home</h1>
                </div>
            </div>

            {/* Tweet Composer  */}
            <TweetComposer user={session?.user} />

            {/* Tweet Feed  */}
            <div className='divide-y divide-border'>
                {tweets.length > 0 ? (
                    tweets.map((tweet, key) => (
                        <Tweet
                            key={key}
                            tweet={tweet}
                            currentUserId={session?.user.id}
                        />
                    ))
                ) : (
                    <div className='p-8 text-center'>
                        <p>No tweets yet, Be the first to tweet !</p>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
