import Image from 'next/image';
import { pathwayAnatomy } from '@/data/pathway-anatomy';
import type { Pathway } from '@/lib/types';

export function PathwayAnatomy({ pathway }: { pathway: Pathway }) {
  const anatomy = pathwayAnatomy[pathway.id];
  const mobility = pathway.category === 'Mobility';
  const artworkSrc = `/images/pathway-anatomy/body-atlas-${pathway.id}-v1.webp`;

  return (
    <section id="pathway-anatomy" className="pathway-anatomy-card" aria-labelledby="pathway-anatomy-title">
      <div className="pathway-anatomy-visual">
        <div className="anatomy-figure-heading"><span>FRONT</span><span>BACK</span></div>
        <Image
          src={artworkSrc}
          alt={`Illustrated body areas involved in the ${pathway.name} pathway`}
          width={1300}
          height={1209}
          sizes="(max-width: 720px) calc(100vw - 60px), 380px"
          unoptimized
        />
      </div>
      <div className="pathway-anatomy-copy">
        <p className="eyebrow">BODY AREAS</p>
        <h2 id="pathway-anatomy-title">{mobility ? 'Where movement is being developed.' : 'Where your body is working.'}</h2>
        <p>A simple view of the main areas involved. The exact emphasis changes with your level, technique and body.</p>
        <div className="anatomy-key primary"><i/><div><small>{mobility ? 'MOBILITY EMPHASIS' : 'PRIMARY WORK'}</small><strong>{anatomy.primaryLabels.join(' · ')}</strong></div></div>
        <div className="anatomy-key supporting"><i/><div><small>SUPPORT &amp; STABILITY</small><strong>{anatomy.supportingLabels.join(' · ')}</strong></div></div>
      </div>
    </section>
  );
}
