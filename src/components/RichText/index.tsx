import React, { Fragment } from 'react'
import escapeHTML from 'escape-html'
import { Text } from 'slate'

interface RichTextProps {
    content: any
    className?: string
}

export default function RichText({ content, className }: RichTextProps) {
    if (!content) {
        return null
    }

    return (
        <div className={className}>
            {serialize(content)}
        </div>
    )
}

function serialize(children: any): React.ReactNode[] {
    return children.map((node: any, i: number) => {
        if (Text.isText(node)) {
            let text = <span dangerouslySetInnerHTML={{ __html: escapeHTML(node.text) }} />

            if ((node as any).bold) {
                text = <strong key={i}>{text}</strong>
            }

            if ((node as any).code) {
                text = <code key={i}>{text}</code>
            }

            if ((node as any).italic) {
                text = <em key={i}>{text}</em>
            }

            if ((node as any).underline) {
                text = <span style={{ textDecoration: 'underline' }} key={i}>{text}</span>
            }

            if ((node as any).strikethrough) {
                text = <span style={{ textDecoration: 'line-through' }} key={i}>{text}</span>
            }

            return <Fragment key={i}>{text}</Fragment>
        }

        if (!node) {
            return null
        }

        switch (node.type) {
            case 'h1':
                return <h1 key={i} className="text-4xl font-bold my-4">{serialize(node.children)}</h1>
            case 'h2':
                return <h2 key={i} className="text-3xl font-bold my-3">{serialize(node.children)}</h2>
            case 'h3':
                return <h3 key={i} className="text-2xl font-bold my-2">{serialize(node.children)}</h3>
            case 'h4':
                return <h4 key={i} className="text-xl font-bold my-2">{serialize(node.children)}</h4>
            case 'h5':
                return <h5 key={i} className="text-lg font-bold my-1">{serialize(node.children)}</h5>
            case 'h6':
                return <h6 key={i} className="text-base font-bold my-1">{serialize(node.children)}</h6>
            case 'quote':
                return <blockquote key={i} className="border-l-4 border-gray-300 pl-4 italic my-4">{serialize(node.children)}</blockquote>
            case 'ul':
                return <ul key={i} className="list-disc list-inside my-4">{serialize(node.children)}</ul>
            case 'ol':
                return <ol key={i} className="list-decimal list-inside my-4">{serialize(node.children)}</ol>
            case 'li':
                return <li key={i}>{serialize(node.children)}</li>
            case 'link':
                return (
                    <a
                        href={escapeHTML(node.url)}
                        key={i}
                        className="text-blue-600 hover:underline"
                        target={node.newTab ? '_blank' : undefined}
                        rel={node.newTab ? 'noopener noreferrer' : undefined}
                    >
                        {serialize(node.children)}
                    </a>
                )

            default:
                return <p key={i} className="my-2">{serialize(node.children)}</p>
        }
    })
}
