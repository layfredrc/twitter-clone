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
import { signInWithEmail } from '@/lib/auth/auth-actions'
import { Chrome } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SignIn() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await signInWithEmail(formData.email, formData.password)
        } catch (err) {
            setError('An error occured, please try again')
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
                        Sign in to Twitter
                    </CardTitle>
                    <CardDescription>
                        Enter tour credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3 mb-6'>
                        <Button className='w-full h-12 bg-white border border-gray-300 text-black hover:bg-gray-50 cursor-pointer'>
                            <Chrome className='w-5 h-5 mr-2' /> Sign in with
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
                        onSubmit={handleSignIn}
                    >
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

                        <Button
                            type='submit'
                            className='w-full h-12 bg-primary text-primary-foreground hover:bg-gray-800'
                        >
                            Create Account
                        </Button>
                    </form>
                    <div className='mt-6 text-center'>
                        <p className='text-sm text-muted-foreground'>
                            Don&apos;t have an account ?{' '}
                            <Link
                                href='/sign-up'
                                className='text-primary hover:underline'
                            >
                                Sign up
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
