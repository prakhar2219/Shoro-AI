import React from 'react';

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
  attrs?: Record<string, any>;
}

interface ServerTipTapRendererProps {
  content: TipTapNode[];
  className?: string;
}

export function ServerTipTapRenderer({ content, className = '' }: ServerTipTapRendererProps) {
  const renderNode = (node: TipTapNode): React.ReactNode => {
    if (node.type === 'text') {
      let text = node.text || '';
      
      // Apply marks to text
      if (node.marks) {
        node.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'strike':
              text = `<s>${text}</s>`;
              break;
            case 'code':
              text = `<code>${text}</code>`;
              break;
            case 'link':
              const href = mark.attrs?.href || '#';
              text = `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
              break;
            case 'highlight':
              text = `<mark>${text}</mark>`;
              break;
          }
        });
      }
      
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }

    // Handle block-level nodes
    switch (node.type) {
      case 'paragraph':
        return (
          <p className="mb-4 last:mb-0">
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </p>
        );
      
      case 'heading':
        const level = node.attrs?.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag className={`mb-4 font-bold ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`}>
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </HeadingTag>
        );
      
      case 'bulletList':
        return (
          <ul className="list-disc list-inside mb-4 space-y-2">
            {node.content?.map((child, index) => (
              <li key={index}>
                {renderNode(child)}
              </li>
            ))}
          </ul>
        );
      
      case 'orderedList':
        return (
          <ol className="list-decimal list-inside mb-4 space-y-2">
            {node.content?.map((child, index) => (
              <li key={index}>
                {renderNode(child)}
              </li>
            ))}
          </ol>
        );
      
      case 'listItem':
        return (
          <>
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </>
        );
      
      case 'blockquote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 bg-gray-50 py-2">
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </blockquote>
        );
      
      case 'codeBlock':
        return (
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <code className="text-sm">
              {node.content?.map((child, index) => (
                <React.Fragment key={index}>
                  {renderNode(child)}
                </React.Fragment>
              ))}
            </code>
          </pre>
        );
      
      case 'horizontalRule':
        return <hr className="my-6 border-gray-300" />;
      
      case 'image':
        const src = node.attrs?.src || '';
        const alt = node.attrs?.alt || '';
        const title = node.attrs?.title || '';
        return (
          <figure className="my-6">
            <img 
              src={src} 
              alt={alt} 
              title={title}
              className="max-w-full h-auto rounded-lg shadow-md"
            />
            {title && (
              <figcaption className="text-center text-sm text-gray-600 mt-2">
                {title}
              </figcaption>
            )}
          </figure>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-gray-300">
              {node.content?.map((child, index) => (
                <React.Fragment key={index}>
                  {renderNode(child)}
                </React.Fragment>
              ))}
            </table>
          </div>
        );
      
      case 'tableRow':
        return (
          <tr className="border-b border-gray-300">
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </tr>
        );
      
      case 'tableCell':
        const isHeader = node.attrs?.background === 'header';
        const CellTag = isHeader ? 'th' : 'td';
        return (
          <CellTag className={`p-3 border-r border-gray-300 ${isHeader ? 'bg-gray-100 font-semibold' : ''}`}>
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </CellTag>
        );
      
      case 'tableHeader':
        return (
          <thead className="bg-gray-100">
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </thead>
        );
      
      case 'tableBody':
        return (
          <tbody>
            {node.content?.map((child, index) => (
              <React.Fragment key={index}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </tbody>
        );
      
      default:
        // For unknown node types, try to render content if available
        if (node.content) {
          return (
            <>
              {node.content.map((child, index) => (
                <React.Fragment key={index}>
                  {renderNode(child)}
                </React.Fragment>
              ))}
            </>
          );
        }
        return null;
    }
  };

  if (!content || content.length === 0) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        No content available
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {content.map((node, index) => (
        <React.Fragment key={index}>
          {renderNode(node)}
        </React.Fragment>
      ))}
    </div>
  );
}
