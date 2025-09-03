"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/contexts/auth-context"
import { updateProfile } from "@/app/actions/auth"
import { Loader2, Building } from "lucide-react"

const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
})

type BusinessFormData = z.infer<typeof businessSchema>

interface BusinessSetupProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onFinish: () => void
}

export function BusinessSetup({ onNext }: BusinessSetupProps) {
  const { user, refreshSession } = useAuth()
  const [error, setError] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      firstName: user?.user_metadata?.first_name || "",
      lastName: user?.user_metadata?.last_name || "",
      businessName: user?.user_metadata?.business_name || "",
    },
  })

  const onSubmit = async (data: BusinessFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await updateProfile(data)
      
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        await refreshSession()
        onNext()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Tell us about your business</h3>
          <p className="text-sm text-muted-foreground">
            This information will help us personalize your experience
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Enter your business name"
            {...register("businessName")}
            disabled={isLoading}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...register("firstName")}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register("lastName")}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </form>
    </div>
  )
}