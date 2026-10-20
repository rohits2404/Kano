import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { loginMutationFn } from "@/lib/api";
import { CURRENT_USER_QUERY_KEY } from "@/context/auth-context";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { GithubButton } from "@/components/auth/github-button";
import { Separator } from "@/components/ui/separator";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { Spinner } from "@/components/ui/spinner";

const signInSchema = z.object({
    email: z.string().trim().email("Enter a Valid Work Email"),
    password: z.string().min(1, "Enter Your Password"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect");

    const form = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: loginMutationFn,
        onSuccess: ({ user }) => {
            queryClient.setQueryData(CURRENT_USER_QUERY_KEY, { user });
            navigate(redirect?.startsWith("/") ? redirect : "/dashboard");
        },
        onError: (error: { message: string }) => toast.error(error.message),
    });

    return (
        <AuthLayout
            title={
                <>
                    Welcome Back To
                    <br />
                    Your Canvas.
                </>
            }
            description="Pick Up Where Your Team Left Off And Keep The Ideas Moving."
            headerAction={
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        New to Kano?
                    </span>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/sign-up">Create Account</Link>
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-6">
                <Logo className="lg:hidden" />

                <div className="flex flex-col gap-1.5">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground">
                        Sign In To Continue Collaborating With Your Team.
                    </p>
                </div>

                <GithubButton label="Continue With Github" />

                <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground">Or</span>
                    <Separator className="flex-1" />
                </div>

                <form onSubmit={form.handleSubmit((values) => mutate(values))}>
                    <FieldGroup>
                        <Field
                            data-invalid={
                                !!form.formState.errors.email || undefined
                            }
                        >
                            <FieldLabel htmlFor="email">Work Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                autoComplete="email"
                                aria-invalid={
                                    !!form.formState.errors.email || undefined
                                }
                                {...form.register("email")}
                            />
                            {form.formState.errors.email ? (
                                <FieldDescription>
                                    {form.formState.errors.email.message}
                                </FieldDescription>
                            ) : null}
                        </Field>

                        <Field
                            data-invalid={
                                !!form.formState.errors.password || undefined
                            }
                        >
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <PasswordInput
                                id="password"
                                placeholder="Enter Your Password"
                                autoComplete="current-password"
                                aria-invalid={
                                    !!form.formState.errors.password ||
                                    undefined
                                }
                                {...form.register("password")}
                            />
                            {form.formState.errors.password ? (
                                <FieldDescription>
                                    {form.formState.errors.password.message}
                                </FieldDescription>
                            ) : null}
                        </Field>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Spinner data-icon="inline-start" />
                            ) : null}
                            Sign In
                        </Button>
                    </FieldGroup>
                </form>
            </div>
        </AuthLayout>
    );
}
