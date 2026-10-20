import { teamInitials, useTeams } from "@/context/teams-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type CreateTeamDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateTeamDialog({
    open,
    onOpenChange,
}: CreateTeamDialogProps) {
    const { teams, createTeam, selectTeam, isCreatingTeam } = useTeams();

    const schema = z.object({
        name: z
            .string()
            .trim()
            .min(2, "Team Name Must Be At Least 2 Characters")
            .max(40, "Keep It Under 40 Characters")
            .refine(
                (name) =>
                    !teams.some(
                        (team) =>
                            team.name.toLowerCase() === name.toLowerCase(),
                    ),
                "A Team With This Name Already Exists",
            ),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { name: "" },
    });

    useEffect(() => {
        if (open) form.reset({ name: "" });
    }, [open, form]);

    const name = form.watch("name");
    const error = form.formState.errors.name;

    const onSubmit = form.handleSubmit(async ({ name }) => {
        try {
            const team = await createTeam(name);
            selectTeam(team.id);
            toast.success(`${team.name} Created`);
            onOpenChange(false);
        } catch (error) {
            toast.error(
                (error as { message?: string }).message ??
                    "Could Not Create Team",
            );
        }
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!isCreatingTeam) onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-6 p-3">
                        <DialogHeader>
                            <DialogTitle>Create a Team</DialogTitle>
                            <DialogDescription>
                                Teams Group People And Their Boards. Only Team
                                Members Can Open a Team's Boards.
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field data-invalid={!!error || undefined}>
                                <FieldLabel htmlFor="team-name">
                                    Team Name
                                </FieldLabel>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                                        {teamInitials(name) || "T"}
                                    </span>
                                    <Input
                                        id="team-name"
                                        placeholder="e.g. Design Team"
                                        autoFocus
                                        aria-invalid={!!error || undefined}
                                        {...form.register("name")}
                                    />
                                </div>
                                {error ? (
                                    <FieldError>{error.message}</FieldError>
                                ) : (
                                    <FieldDescription>
                                        You'll Be Added As The First Member.
                                    </FieldDescription>
                                )}
                            </Field>
                        </FieldGroup>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isCreatingTeam}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isCreatingTeam}>
                            {isCreatingTeam ? (
                                <Spinner data-icon="inline-start" />
                            ) : null}
                            Create Team
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
