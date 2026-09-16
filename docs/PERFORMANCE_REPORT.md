# Performance Report — Resource Run v13 RC1

## Performance strategy

Resource Run is a small stateful simulation rather than a media-heavy 3D game, so the release candidate prioritizes fast first interaction, stable layout, low DOM churn, and modest GPU use.

## Implemented

- No gameplay raster-image dependency.
- Inline SVG icon system and CSS-based operational atmosphere.
- Short procedural Web Audio cues instead of downloaded audio files.
- Queue, inventory, and map rendering skip DOM replacement when their state signature is unchanged.
- Operational Intelligence feed is capped and only the newest records are emphasized.
- Mobile disables `backdrop-filter` to reduce compositing cost.
- Ambient scan motion uses transforms and is removed under reduced-motion preferences.
- A same-origin service worker caches static assets and uses network-first navigation.
- Local gameplay does not depend on organizational APIs.
- Analytics / session persistence remains capped by the existing platform services.

## Core Web Vitals posture

The v13 release avoids large hero imagery and newly introduced blocking media. The initial layout is CSS-driven, which reduces layout instability risk. Real LCP, INP, and CLS values still require browser measurement against the deployed URL; source review alone cannot provide valid field or lab scores.

## Memory controls

The UI caps:

- intelligence-feed history;
- toast lifetime;
- impact-marker lifetime;
- local analytics history through the platform service;
- stored session reports through the platform service.

Dynamic resource map markers are rebuilt only when resource state changes.

## Release recommendation

Keep future decorative assets optional and below the fold. Avoid autoplay video, continuous canvas rendering, large uncompressed imagery, or continuous background audio in the default operational view.
