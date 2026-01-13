'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signUpWithEmail } from '@/lib/auth/auth-actions'
import { authClient } from '@/lib/auth/auth-client'
import { Chrome } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            return
        }
        setIsLoading(true)
        setError('')

        try {
            await signUpWithEmail(
                formData.email,
                formData.password,
                formData.name,
                formData.username
            )
        } catch (err) {
            setError('An error occured, please try again ' + err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setIsLoading(true)
        setError('')

        try {
            const result = await authClient.signIn.social({
                provider: 'google',
            })

            if (!result) {
                router.push('/')
            }
        } catch (err) {
            setError('An error occured Please try again')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-background'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto'>
                        <span className='text-primary-foreground font-bold text-xl'>
                            𝕏
                        </span>
                    </div>
                    <CardTitle className='text-2xl'>
                        Create your account
                    </CardTitle>
                    <CardDescription>Join Twitter today</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3 mb-6'>
                        <Button
                            onClick={handleGoogleSignUp}
                            disabled={isLoading}
                            className='w-full h-12 bg-white border border-gray-300 text-black hover:bg-gray-50 cursor-pointer'
                        >
                            <Chrome className='w-5 h-5 mr-2' /> Sign up with
                            Google
                        </Button>
                    </div>
                    <div className='relative mb-6'>
                        <div className='absolute inset-0 flex items-center'>
                            <span className='w-full border-t'></span>
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                            <span className='bg-background px-2 text-muted-foreground'>
                                Or
                            </span>
                        </div>
                    </div>

                    <form
                        className='space-y-4'
                        onSubmit={handleSignUp}
                    >
                        <div className='space-y-2'>
                            <label
                                htmlFor='name'
                                className='text-sm font-medium'
                            >
                                Full Name
                            </label>
                            <Input
                                name='name'
                                id='name'
                                type='text'
                                placeholder='Enter your full name'
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label
                                htmlFor='username'
                                className='text-sm font-medium'
                            >
                                Username
                            </label>
                            <Input
                                name='username'
                                id='username'
                                type='text'
                                placeholder='Choose a username'
                                required
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label
                                htmlFor='name'
                                className='text-sm font-medium'
                            >
                                Email
                            </label>
                            <Input
                                name='email'
                                id='email'
                                type='email'
                                placeholder='Enter your email'
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label
                                htmlFor='password'
                                className='text-sm font-medium'
                            >
                                Password
                            </label>
                            <Input
                                name='password'
                                id='password'
                                type='password'
                                placeholder='Choose a password'
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label
                                htmlFor='confirmPassword'
                                className='text-sm font-medium'
                            >
                                Confirm Password
                            </label>
                            <Input
                                name='confirmPassword'
                                id='confirmPassword'
                                type='password'
                                placeholder='Enter your full name'
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <Button
                            type='submit'
                            className='w-full h-12 bg-primary text-primary-foreground hover:bg-gray-800'
                            disabled={isLoading}
                        >
                            Create Account
                        </Button>
                    </form>
                    <div className='mt-6 text-center'>
                        <p className='text-sm text-muted-foreground'>
                            Already have an account ?{' '}
                            <Link
                                href='/sign-in'
                                className='text-primary hover:underline'
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
                {error && (
                    <div className='text-red p-3 bg-red-50 rounded'>
                        {error}
                    </div>
                )}
            </Card>
        </div>
    )
}
