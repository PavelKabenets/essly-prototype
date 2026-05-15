import { RitualConfigScreen } from '@/components/RitualConfigScreen';

const TIME_PRESETS = [
  '05:30',
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
];

export default function MorningAlignment() {
  return (
    <RitualConfigScreen
      kind="morning"
      title="Morning Alignment"
      intro="A short reflection from your companion at the time you choose. Use it to ease into the day before the noise starts."
      toggleLabel="Morning Alignment"
      enabledHintOn={(time) => `Scheduled for ${time} every morning.`}
      enabledHintOff="Turn on to receive your daily check-in."
      icon="sunny-outline"
      timePresets={TIME_PRESETS}
      pushHint="Wake the phone screen with your morning message."
      scheduleTestLabel="Test: schedule for 1 minute from now"
    />
  );
}
