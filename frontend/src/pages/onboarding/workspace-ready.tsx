import { AuthLayout } from "@/components/layouts/auth-layout";
import { LogoMark } from "@/components/logo";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { Button } from "@/components/ui/button";
import {
    ArrowRightIcon,
    CheckCircle2Icon,
    SparklesIcon,
    UsersIcon,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";

export default function WorkspaceReadyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const invited = Number(searchParams.get("invited") ?? 0);

    const summary = [
        {
            icon: <LogoMark className="size-5" />,
            title: "Workspace Created",
            description: "Your Workspace Is Ready To Use.",
        },
        {
            icon: <UsersIcon className="size-5" />,
            title:
                invited > 0
                    ? `${invited} Teammates Invited`
                    : "No Invites Sent Yet",
            description:
                invited > 0
                    ? "Invitations Have Been Sent To Your Teammates."
                    : "You Can Invite Teammates Any Time From The Dashboard.",
        },
        {
            icon: <SparklesIcon className="size-5" />,
            title: "You Are All Set",
            description: "Start Creating Boards And Bring Your Ideas To Life.",
        },
    ];

    return (
        <AuthLayout
            title="You Are All Set!"
            description="Your Workspace Is Ready. Start Collaborating And Turn Your Ideas Into Real Progress."
        >
            <div className="flex flex-col gap-8">
                <OnboardingStepper current={3} />

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary">
                        <LogoMark className="size-9" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Your Workspace Is Ready!
                    </h1>
                    <p className="text-muted-foreground">
                        You Can Now Create Boards, Invite More Teammates, And
                        Start Collaborating With AI.
                    </p>
                </div>

                <ul className="flex flex-col gap-4 rounded-xl border p-4">
                    {summary.map((item) => (
                        <li
                            key={item.title}
                            className="flex items-center gap-3"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                {item.icon}
                            </span>
                            <span className="flex flex-1 flex-col">
                                <span className="font-medium">
                                    {item.title}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {item.description}
                                </span>
                            </span>
                            <CheckCircle2Icon className="size-5 shrink-0 text-primary" />
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                    >
                        Go To Dashboard
                        <ArrowRightIcon data-icon="inline-end" />
                    </Button>

                    <Link
                        to="/dashboard"
                        className="text-sm text-muted-foreground underline"
                    >
                        Invite More People Later
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
