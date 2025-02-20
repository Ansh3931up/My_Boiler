'use client'
import {useSignUp} from "@clerk/nextjs"
import {useRouter} from "next/navigation"
import { useState } from "react";
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import {Alert,AlertTitle,AlertDescription} from "@/components/ui/alert"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/otp"


export default function SignUpPage() {
  const { signUp, setActive,isLoaded } = useSignUp();

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  console.log("sign up page",router);
  if(!isLoaded){
    return console.log("not loaded");
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if(!isLoaded){
        return ;
    }
    try{
        setError(null);
        setIsPending(true);
        await signUp?.create({
            emailAddress: email,
            password,
            username,
        });
        await signUp.prepareEmailAddressVerification({
            strategy:'email_code'
        });
        setVerificationStep(true);
        
    }
    catch(error:any){
      setError(error.message || "Something went wrong. Please try again.");
        console.log(JSON.stringify(error,null,2));
    }
    finally{
        setIsPending(false);
    }
  }
  async function verifyEmail(e: React.FormEvent) {
    e.preventDefault()
    if(!isLoaded) return

    try {
      setIsPending(true)
      
      // Add check for already verified status
      if (signUp?.verifications.emailAddress?.status === "verified") {
        // If email is verified, attempt to complete the sign-up
        const completeSignUp = await signUp.create({
          phoneNumber: "" // Add phone handling if required
        })
        
        if (completeSignUp.status === "complete") {
          await setActive({ session: completeSignUp.createdSessionId })
          router.push('/')
        }
      } else {
        // Verify email if not already verified
        const signupResult = await signUp?.attemptEmailAddressVerification({
          code
        })
        console.log("signupResult",signupResult);
        if(signupResult?.status==='complete'){
            console.log("signupResult",signupResult);
            await setActive({session:signupResult.createdSessionId});
            router.push('/');
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {verificationStep ? 'Verify your email' : 'Create an account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!verificationStep ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

             {/* CAPTCHA element */}
             <div id="clerk-captcha" className="!mt-6" />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-sm text-muted-foreground mt-2">
                  Please enter the verification code sent to your email
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPending || code.length !== 6}
              >
                {isPending ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


