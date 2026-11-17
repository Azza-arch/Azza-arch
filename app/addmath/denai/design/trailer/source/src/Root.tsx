import React from 'react';
import { Composition } from 'remotion';
import { Trailer } from './Trailer';
import { Plate } from './Plate';
export const Root: React.FC = () => (<><Composition id="DenaiTrailer" component={Trailer} durationInFrames={900} fps={30} width={1920} height={1080} /><Composition id="NavyBackground" component={Plate} defaultProps={{ bgOnly: true }} durationInFrames={1} fps={30} width={1920} height={1080} /><Composition id="JournalPlate" component={Plate} durationInFrames={1} fps={30} width={1920} height={1080} /></>);
