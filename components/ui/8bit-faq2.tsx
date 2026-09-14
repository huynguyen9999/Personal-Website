"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FAQItem } from "@/lib/faq";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit-card";

export type { FAQItem };

interface FAQ2Props {
  className?: string;
  description?: string;
  items: FAQItem[];
  title?: string;
  titleId?: string;
}

export default function FAQ2({
  title = "Quick answers",
  description,
  items,
  className,
  titleId,
}: FAQ2Props) {
  const baseId = useId();
  const headingId = titleId ?? `${baseId}-title`;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mx-auto max-w-4xl">
        {(title || description) && (
          <div className="faq-intro mb-10 md:mb-12">
            {title && (
              <h2 id={headingId} className="faq-section-title">
                {title}
              </h2>
            )}
            {description && <p className="faq-section-lede">{description}</p>}
          </div>
        )}

        <ul className="grid list-none gap-y-2 p-0 m-0 sm:grid-cols-2 sm:gap-x-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const triggerId = `${baseId}-trigger-${index}`;
            const hasAnswer = item.answer.length > 0;

            return (
              <li key={item.question} className="min-w-0">
                <Card
                  className={cn(
                    "faq-item overflow-hidden transition-[border-color,transform] duration-300 ease-out",
                    isOpen && "-translate-y-px border-ink/35",
                  )}
                >
                  <button
                    type="button"
                    id={triggerId}
                    className="faq-trigger flex w-full items-start gap-3 border-0 bg-transparent p-0 text-left text-inherit"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                  >
                    <CardHeader className="flex-1 pb-2 pt-4">
                      <CardTitle className="faq-question pr-2">{item.question}</CardTitle>
                    </CardHeader>
                    <span
                      className={cn(
                        "mr-4 mt-5 inline-flex shrink-0 text-ink transition-transform duration-300 ease-out motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    >
                      <ChevronDown className="size-4 stroke-[2]" />
                    </span>
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <CardContent
                        className={cn(
                          "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                          isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                        )}
                      >
                        {hasAnswer ? <p className="faq-answer">{item.answer}</p> : null}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
