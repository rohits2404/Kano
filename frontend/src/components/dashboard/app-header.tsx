import { BellIcon, SearchIcon, UserPlusIcon } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";
import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";

export function AppHeader() {
    return (
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-13 w-full max-w-7xl xl:max-w-297.5 items-center justify-between gap-4 px-6 lg:px-10">
                <InputGroup className="h-9 max-w-xl flex-1 border-transparent bg-muted/70 shadow-none">
                    <InputGroupAddon align="inline-start" className="pl-3">
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput placeholder="Search Boards, Templates, Or Anything..." />
                    <InputGroupAddon align="inline-end" className="pr-3">
                        <kbd className="text-xs font-normal text-muted-foreground">
                            ⌘ K
                        </kbd>
                    </InputGroupAddon>
                </InputGroup>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <UserPlusIcon data-icon="inline-start" />
                        Invite Members
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Notifications"
                        className="relative"
                    >
                        <BellIcon className="size-5" />
                        <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
                    </Button>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
