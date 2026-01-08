"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ArrowLeft, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

const signupSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    otp: z.string().optional()
})

export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Details, 2: OTP
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            otp: ""
        }
    })

    const handleSendOtp = async () => {
        const values = form.getValues()
        if (!values.email || !values.password || !values.name) {
            form.trigger(["name", "email", "password"])
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to send OTP")

            setStep(2)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (values: z.infer<typeof signupSchema>) => {
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Registration failed")

            // Redirect to Login
            router.push("/client-login?registered=true")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left: Branding Side (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#002147] relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="relative z-10">
                    <Link href="/" className="inline-block bg-white/10 backdrop-blur-sm p-3 rounded-lg hover:bg-white/20 transition-colors">
                        <Image src="/images/logo.png" alt="Moksh Promotion" width={140} height={45} className="h-8 w-auto brightness-0 invert" />
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg space-y-6">
                    <h2 className="text-4xl font-bold leading-tight">Join India's Leading OOH Media Platform.</h2>
                    <ul className="space-y-4 text-blue-100">
                        {["Track detailed campaign analytics", "Secure & transparent billing", "24/7 Support for your brand"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-blue-300" /></div>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 flex gap-4 text-sm text-blue-300">
                    <span>© {new Date().getFullYear()} Moksh Promotion</span>
                </div>

                {/* Decorative Backgrounds */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>


            {/* Right: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#002147] transition-colors mb-6 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-2">Start your journey with Moksh Promotion</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? "bg-[#002147]" : "bg-gray-200"}`}></div>
                        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? "bg-[#002147]" : "bg-gray-200"}`}></div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            {...form.register("name")}
                                            className="block w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#002147] focus:ring-[#002147] sm:text-sm shadow-sm transition-all hover:border-gray-300"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {form.formState.errors.name && (
                                        <p className="text-red-500 text-xs ml-1">{form.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            {...form.register("email")}
                                            type="email"
                                            className="block w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#002147] focus:ring-[#002147] sm:text-sm shadow-sm transition-all hover:border-gray-300"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {form.formState.errors.email && (
                                        <p className="text-red-500 text-xs ml-1">{form.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            {...form.register("password")}
                                            type="password"
                                            className="block w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#002147] focus:ring-[#002147] sm:text-sm shadow-sm transition-all hover:border-gray-300"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {form.formState.errors.password && (
                                        <p className="text-red-500 text-xs ml-1">{form.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#002147] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002147] disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email & Continue"}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-blue-50 border border-blue-100 text-[#002147] p-4 rounded-xl text-sm flex gap-3">
                                    <Mail className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold mb-1">We sent a 6-digit code to you.</p>
                                        <p>Check <strong>{form.getValues('email')}</strong> and enter it below.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">OTP Code</label>
                                    <input
                                        {...form.register("otp")}
                                        className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-center tracking-[0.5em] text-2xl font-bold text-gray-900 placeholder-gray-300 focus:border-[#002147] focus:ring-[#002147] shadow-sm transition-all"
                                        placeholder="······"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={form.handleSubmit(handleRegister)}
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Create Account"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-center text-sm text-gray-500 hover:text-[#002147] font-medium transition-colors"
                                >
                                    ← Change Email Address
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-50 text-gray-500">Already a member?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/client-login" className="text-[#002147] font-bold text-sm hover:underline">
                            Sign In to Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
