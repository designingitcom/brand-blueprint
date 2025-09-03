"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Loader2, Plus, X } from "lucide-react"

const inviteSchema = z.object({
  emails: z.array(z.string().email("Invalid email address")).min(1, "At least one email is required"),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface TeamInviteProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onFinish: () => void
}

export function TeamInvite({ onFinish, onSkip }: TeamInviteProps) {
  const [error, setError] = React.useState<string>("")
  const [success, setSuccess] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [emailInputs, setEmailInputs] = React.useState<string[]>([""])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      emails: [""],
    },
  })

  const watchedEmails = watch("emails")

  const addEmailInput = () => {
    const newEmails = [...emailInputs, ""]
    setEmailInputs(newEmails)
    setValue("emails", newEmails)
  }

  const removeEmailInput = (index: number) => {
    if (emailInputs.length > 1) {
      const newEmails = emailInputs.filter((_, i) => i !== index)
      setEmailInputs(newEmails)
      setValue("emails", newEmails)
    }
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emailInputs]
    newEmails[index] = value
    setEmailInputs(newEmails)
    setValue("emails", newEmails)
  }

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const validEmails = data.emails.filter(email => email.trim() !== "")
      
      if (validEmails.length === 0) {
        onFinish()
        return
      }

      // TODO: Send invitations API call
      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Sending invitations to:", validEmails)
      
      setSuccess(`Invitations sent to ${validEmails.length} email(s)!`)
      
      setTimeout(() => {
        onFinish()
      }, 2000)
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
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Invite your team</h3>
          <p className="text-sm text-muted-foreground">
            Collaborate with team members on your brand projects
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Label>Team Member Email Addresses</Label>
          {emailInputs.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              {emailInputs.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeEmailInput(index)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addEmailInput}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Email
          </Button>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
            Skip for now
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invitations
          </Button>
        </div>
      </form>

      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="font-medium mb-2">Benefits of team collaboration:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Share brand assets and guidelines</li>
          <li>• Assign tasks and track progress</li>
          <li>• Maintain brand consistency across teams</li>
          <li>• Get feedback and approvals faster</li>
        </ul>
      </div>
    </div>
  )
}