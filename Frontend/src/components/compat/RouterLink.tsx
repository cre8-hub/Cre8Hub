import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

type RouterLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
};

export default function RouterLink({ href, children, ...props }: RouterLinkProps) {
  return (
    <ReactRouterLink to={href} {...props}>
      {children}
    </ReactRouterLink>
  );
}
