import type { SendInvitesResponse, WorkspaceRole } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const ROLE_OPTIONS: { value: WorkspaceRole; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" },
];

type InviteMembersDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (
        email: string,
        role: WorkspaceRole,
    ) => Promise<SendInvitesResponse>;
};

export function InviteMembersDialog({
    open,
    onOpenChange,
    onInvite,
}: InviteMembersDialogProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<WorkspaceRole>("member");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const value = email.trim();
        if (!value) return;

        setSubmitting(true);
        try {
            const result = await onInvite(value, role);
            if (result.invited.length > 0) {
                toast.success(`Invitation Sent To ${value}`);
            } else {
                toast.info(
                    `${value} Is Already a Member Or Has a Pending Invite`,
                );
            }
            setEmail("");
            setRole("member");
            onOpenChange(false);
        } catch (error) {
            toast.error(
                (error as { message?: string }).message ??
                    "Could Not Send Invitation",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-6 p-3">
                        <DialogHeader>
                            <DialogTitle>Invite Members</DialogTitle>
                            <DialogDescription>
                                Invite Teammates To Your Workspace. They&apos;ll
                                Get An Email With a Link To Join.
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="invite-email">
                                    Email Address
                                </FieldLabel>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    autoFocus
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Role</FieldLabel>
                                <Select
                                    value={role}
                                    onValueChange={(value) =>
                                        setRole(value as WorkspaceRole)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {ROLE_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldGroup>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={!email.trim() || submitting}
                        >
                            {submitting ? (
                                <Spinner data-icon="inline-start" />
                            ) : null}
                            Send Invite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
