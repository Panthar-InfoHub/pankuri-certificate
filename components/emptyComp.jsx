import { ArrowUpRightIcon, TreePine } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

export function EmptyDemo() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <TreePine />
                </EmptyMedia>
                <EmptyTitle>Work is in progress</EmptyTitle>
                <EmptyDescription>
                </EmptyDescription>
            </EmptyHeader>

        </Empty>
    )
}
