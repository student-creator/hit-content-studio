import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Joyride, EventData, STATUS, ACTIONS, EVENTS, Step } from 'react-joyride';
import { useI18n } from '../i18n';

type TourStep = Step & { route?: string };

interface TutorialProps {
  launchKey?: number;
}

export default function Tutorial({ launchKey = 0 }: TutorialProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: TourStep[] = useMemo(() => [
    { route: '/generate', target: 'body', placement: 'center', title: t('tour.welcome.title'), content: t('tour.welcome.desc') },
    { route: '/generate', target: '[data-tour="sidebar-nav"]', placement: 'right', title: t('tour.sidebar.title'), content: t('tour.sidebar.desc') },
    { route: '/generate', target: '[data-tour="module-content"]', title: t('tour.content.title'), content: t('tour.content.desc') },
    { route: '/generate', target: '[data-tour="voice-selector"]', title: t('tour.voice.title'), content: t('tour.voice.desc') },
    { route: '/generate', target: '[data-tour="generate-button"]', title: t('tour.generate.title'), content: t('tour.generate.desc') },
    { route: '/visuals', target: '[data-tour="module-visuals"]', title: t('tour.visuals.title'), content: t('tour.visuals.desc') },
    { route: '/visuals', target: '[data-tour="visuals-mode-toggle"]', title: t('tour.visualsMode.title'), content: t('tour.visualsMode.desc') },
    { route: '/calendar', target: '[data-tour="module-calendar"]', title: t('tour.calendar.title'), content: t('tour.calendar.desc') },
    { route: '/calendar', target: '[data-tour="calendar-add"]', title: t('tour.calendarAdd.title'), content: t('tour.calendarAdd.desc') },
    { route: '/voices', target: '[data-tour="module-voices"]', title: t('tour.voices.title'), content: t('tour.voices.desc') },
    { route: '/voices', target: '[data-tour="voices-create"]', title: t('tour.voicesCreate.title'), content: t('tour.voicesCreate.desc') },
    { route: '/library', target: '[data-tour="module-library"]', title: t('tour.library.title'), content: t('tour.library.desc') },
    { route: '/style-guide', target: '[data-tour="module-styleguide"]', title: t('tour.styleguide.title'), content: t('tour.styleguide.desc') },
  ], [t]);

  const endTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
  }, []);

  useEffect(() => {
    if (launchKey > 0) {
      setStepIndex(0);
      if (location.pathname !== '/generate') {
        navigate('/generate');
        setTimeout(() => setRun(true), 450);
      } else {
        setRun(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchKey]);

  const handleEvent = useCallback((data: EventData) => {
    const { status, type, action } = data;
    const index = (data as any).index ?? 0;

    if (action === ACTIONS.CLOSE) {
      endTour();
      return;
    }

    const finished: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finished.includes(status)) {
      endTour();
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      if (nextIndex < 0 || nextIndex >= steps.length) {
        endTour();
        return;
      }

      const nextStep = steps[nextIndex];
      if (nextStep.route && location.pathname !== nextStep.route) {
        setRun(false);
        navigate(nextStep.route);
        setTimeout(() => {
          setStepIndex(nextIndex);
          setRun(true);
        }, 450);
      } else {
        setStepIndex(nextIndex);
      }
    }
  }, [location.pathname, navigate, steps.length, endTour]);

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: '#6B1E2E',
        textColor: '#1A1F3C',
        zIndex: 10000,
        showProgress: true,
        skipBeacon: true,
      }}
    />
  );
}
