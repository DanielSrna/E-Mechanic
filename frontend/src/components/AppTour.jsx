import { Joyride, STATUS } from 'react-joyride';

export default function AppTour({ steps, run, onFinish }) {
  if (!run || !steps || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks={false}
      hideCloseButton
      callback={(data) => {
        const { status } = data;
        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
          onFinish?.();
        }
      }}
      locale={{
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
        tooltip: {
          fontSize: 14,
        },
        buttonNext: {
          fontSize: 13,
          padding: '8px 16px',
        },
        buttonBack: {
          fontSize: 13,
          marginRight: 8,
        },
      }}
    />
  );
}
