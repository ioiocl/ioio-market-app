import './HtmlContent.css';

function HtmlContent({ html, className = '' }) {
  if (!html) return null;
  
  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default HtmlContent;
