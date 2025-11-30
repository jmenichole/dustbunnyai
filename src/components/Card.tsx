import { ReactNode } from "react";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export default function Card({ className = "", children }: CardProps) {
  return <div className={`card-base ${className}`}>{children}</div>;
}
