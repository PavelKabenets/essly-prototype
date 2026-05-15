import { RitualConfigScreen } from '@/components/RitualConfigScreen';

const TIME_PRESETS = [
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30',
];

export default function EveningWindDown() {
  return (
    <RitualConfigScreen
      kind="evening"
      title="Evening Wind Down"
      intro="A calming reflection before sleep. Let the day soften before tomorrow."
      toggleLabel="Evening Wind Down"
      enabledHintOn={(time) => `Scheduled for ${time} every evening.`}
      enabledHintOff="Turn on to receive an evening reflection."
      icon="moon-outline"
      timePresets={TIME_PRESETS}
      pushHint="Gently chime when it's time to wind down."
      scheduleTestLabel="Test: schedule for 1 minute from now"
    />
  );
}
