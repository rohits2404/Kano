import { AuthLayout } from "@/components/layouts/auth-layout";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
    WorkspaceAvatar,
    workspaceIconColors,
} from "@/components/workspace-avatar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { checkSlugQueryFn, createWorkspaceMutationFn } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { WorkspaceIconColor } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowRightIcon,
    CheckCircle2Icon,
    LoaderIcon,
    SmilePlusIcon,
    XCircleIcon,
    XIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    name: z.string().trim().min(2, "Give Your Workspace a Name"),
    slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9-]*$/, "Use Lowercase Letters, Numbers And Dashes")
        .optional(),
});

type CreateWorkspaceValues = z.infer<typeof schema>;

const iconColors = Object.keys(workspaceIconColors) as WorkspaceIconColor[];

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export default function CreateWorkspacePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<CreateWorkspaceValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", slug: "" },
    });

    const name = form.watch("name");
    const slug = form.watch("slug");
    const initials = name.slice(0, 2).toUpperCase() || "W";
    const [iconColor, setIconColor] = useState<WorkspaceIconColor>("yellow");
    const [emoji, setEmoji] = useState<string | null>(null);
    const [emojiOpen, setEmojiOpen] = useState(false);

    const effectiveSlug = slug || toSlug(name);
    const debouncedSlug = useDebouncedValue(effectiveSlug);

    const slugCheck = useQuery({
        queryKey: ["slug-availability", debouncedSlug],
        queryFn: () => checkSlugQueryFn(debouncedSlug),
        enabled: debouncedSlug.length >= 2,
        staleTime: 30 * 1000,
    });

    const slugState = slugCheck.data?.available
        ? "available"
        : slugCheck.data?.available === false
          ? "taken"
          : slugCheck.isFetching
            ? "checking"
            : "idle";

    const { mutate, isPending } = useMutation({
        mutationFn: createWorkspaceMutationFn,
        onSuccess: ({ workspace }) => {
            queryClient.invalidateQueries({ queryKey: ["my-workspaces"] });
            navigate(`/onboarding/invite?workspaceId=${workspace.id}`);
        },
        onError: (error: { message: string }) => toast.error(error.message),
    });

    return (
        <AuthLayout
            title={
                <>
                    A Workspace
                    <br />
                    For Big Ideas.
                </>
            }
            description="Bring Your Team Together And Turn Ideas Into Real Progress With AI On Your Canvas."
            headerAction={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/sign-in")}
                >
                    Sign Out
                </Button>
            }
        >
            <div className="flex flex-col gap-8">
                <OnboardingStepper current={1} />

                <div className="flex flex-col gap-1.5">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Set Up Your Workspace
                    </h1>
                    <p className="text-muted-foreground">
                        Give Your Team a Name. You Can Change This Later In Your
                        Workspace Settings.
                    </p>
                </div>

                <form
                    onSubmit={form.handleSubmit((values) =>
                        mutate({
                            name: values.name,
                            slug: values.slug || toSlug(values.name),
                            iconType: emoji ? "emoji" : "initials",
                            iconValue: emoji ?? initials,
                            iconColor,
                        }),
                    )}
                >
                    <FieldGroup>
                        <Field
                            data-invalid={
                                !!form.formState.errors.name || undefined
                            }
                        >
                            <FieldLabel htmlFor="name">
                                Workspace Name
                            </FieldLabel>
                            <Input
                                id="name"
                                placeholder="Tech"
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

                        <Field>
                            <FieldLabel htmlFor="slug">
                                Workspace URL (optional)
                            </FieldLabel>
                            <InputGroup
                                className={cn(
                                    slugState === "available" &&
                                        "border-emerald-500",
                                    slugState === "taken" &&
                                        "border-destructive",
                                )}
                            >
                                <InputGroupInput
                                    id="slug"
                                    placeholder={toSlug(name) || "tech"}
                                    value={slug}
                                    onChange={(event) =>
                                        form.setValue(
                                            "slug",
                                            toSlug(event.target.value),
                                        )
                                    }
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupText>.kano.so</InputGroupText>
                                    {slugState === "checking" ? (
                                        <LoaderIcon className="animate-spin" />
                                    ) : slugState === "available" ? (
                                        <CheckCircle2Icon className="text-emerald-600" />
                                    ) : slugState === "taken" ? (
                                        <XCircleIcon className="text-destructive" />
                                    ) : null}
                                </InputGroupAddon>
                            </InputGroup>
                            <FieldDescription
                                className={cn(
                                    slugState === "available" &&
                                        "text-emerald-600",
                                    slugState === "taken" && "text-destructive",
                                )}
                            >
                                {slugState === "checking"
                                    ? "Checking Availability…"
                                    : slugState === "available"
                                      ? `${effectiveSlug}.kano.so Is Available.`
                                      : slugState === "taken"
                                        ? `${effectiveSlug}.kano.so Is Already Taken. Try Another.`
                                        : "This Will Be Your Workspace Link."}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel>Workspace Icon (optional)</FieldLabel>
                            <div className="flex flex-wrap items-center gap-3">
                                <WorkspaceAvatar
                                    name={name || "W"}
                                    iconType={emoji ? "emoji" : "initials"}
                                    iconValue={emoji ?? initials}
                                    iconColor={iconColor}
                                    className={cn(
                                        "size-11 rounded-lg",
                                        emoji ? "text-2xl" : "text-sm",
                                    )}
                                />

                                <div className="h-8 w-px bg-border" />

                                <Popover
                                    open={emojiOpen}
                                    onOpenChange={setEmojiOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Pick An emoji"
                                            className={cn(
                                                "flex size-8 items-center justify-center rounded-full border border-dashed text-muted-foreground hover:bg-muted",
                                                emoji &&
                                                    "border-solid text-base",
                                            )}
                                        >
                                            {emoji ?? (
                                                <SmilePlusIcon className="size-4" />
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-fit p-0"
                                    >
                                        <EmojiPicker
                                            onSelect={(value) => {
                                                setEmoji(value);
                                                setEmojiOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>

                                {iconColors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        aria-label={`Use ${color} background`}
                                        aria-pressed={iconColor === color}
                                        onClick={() => setIconColor(color)}
                                        className={cn(
                                            "size-7 rounded-full ring-offset-2 ring-offset-background transition",
                                            workspaceIconColors[color],
                                            iconColor === color
                                                ? "ring-2 ring-foreground"
                                                : "hover:scale-110",
                                        )}
                                    />
                                ))}

                                {emoji ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Remove emoji"
                                        onClick={() => setEmoji(null)}
                                    >
                                        <XIcon />
                                    </Button>
                                ) : null}
                            </div>
                        </Field>

                        <Button
                            type="submit"
                            className="h-11 w-full"
                            disabled={isPending || slugState === "taken"}
                        >
                            {isPending ? (
                                <Spinner data-icon="inline-start" />
                            ) : null}
                            Continue
                            <ArrowRightIcon data-icon="inline-end" />
                        </Button>
                    </FieldGroup>
                </form>
            </div>
        </AuthLayout>
    );
}
