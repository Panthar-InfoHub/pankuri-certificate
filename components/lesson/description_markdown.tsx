'use client'

import MDEditor from "@uiw/react-md-editor"
import "@uiw/react-markdown-preview/markdown.css";

import { cn } from "@/lib/utils";

type MarkdownPreviewProps = {
    value?: string | null;
    className?: string;
};

const DescriptionMarkdown = ({ value, className }: MarkdownPreviewProps) => {


    return (
        <div data-color-mode="light">
            <MDEditor.Markdown
                source={value || ""}
                className={cn("prose prose-zinc max-w-none bg-transparent!", className)}
                disallowedElements={["img"]}
            />
        </div>
    );
}

export default DescriptionMarkdown