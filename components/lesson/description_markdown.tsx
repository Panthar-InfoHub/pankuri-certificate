'use client'

import MDEditor from "@uiw/react-md-editor"

const DescriptionMarkdown = ({ value }: { value: string }) => {
    return (
        <div data-color-mode="light" >
            <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
        </div>
    )
}

export default DescriptionMarkdown