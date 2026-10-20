import { GithubButton } from "@/components/auth/github-button";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { CURRENT_USER_QUERY_KEY } from "@/context/auth-context";
import { registerMutationFn } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z.object({
    name: z.string().trim().min(2, "Enter Your Full Name"),
    email: z.string().trim().email("Enter a Valid Work Email"),
    password: z.string().min(8, "Password Must Be At Least 8 Characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect");

    const form = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: registerMutationFn,
        onSuccess: ({ user }) => {
            queryClient.setQueryData(CURRENT_USER_QUERY_KEY, { user });
            navigate(
                redirect?.startsWith("/") ? redirect : "/onboarding/workspace",
            );
        },
        onError: (error: { message: string }) => toast.error(error.message),
    });

    return (
        <AuthLayout
            title={
                <>
                    Ideas Move
                    <br />
                    Faster Together.
                </>
            }
            description="Collaborate With Your Team And AI On One Shared Canvas."
            headerAction={
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        Already Have An Account?
                    </span>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/sign-in">Sign In</Link>
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-6">
                <Logo className="lg:hidden" />

                <div className="flex flex-col gap-1.5">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Create Your Account
                    </h1>
                    <p className="text-muted-foreground">
                        Start Collaborating With Your Team Today.
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
                                !!form.formState.errors.name || undefined
                            }
                        >
                            <FieldLabel htmlFor="name">Full Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                autoComplete="name"
                                aria-invalid={
                                    !!form.formState.errors.name || undefined
                                }
                                {...form.register("name")}
                            />
                            {form.formState.errors.name ? (
                                <FieldDescription>
                                    {form.formState.errors.name.message}
                                </FieldDescription>
                            ) : null}
                        </Field>

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
                                placeholder="Create a Strong Password"
                                autoComplete="new-password"
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
                            Create Account
                        </Button>
                    </FieldGroup>
                </form>

                <p className="text-center text-[13px] text-muted-foreground">
                    By Creating An Account, You Agree To Our{" "}
                    <a href="/terms" className="text-foreground underline">
                        Terms Of Service
                    </a>{" "}
                    And{" "}
                    <a href="/privacy" className="text-foreground underline">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </AuthLayout>
    );
}
