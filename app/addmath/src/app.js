import { onRouteChange, startRouter } from './utils/router.js';
import { renderStartScreen } from './screens/startScreen.js';
import { renderFormScreen } from './screens/formScreen.js';
import { renderMapScreen } from './screens/mapScreen.js';
import { renderComingSoonScreen } from './screens/comingSoonScreen.js';
import { renderLessonScreen } from './screens/lessonScreen.js';
import { renderPracticeScreen } from './screens/practiceScreen.js';

const root = document.getElementById('app');

function render(route) {
  const { name, params } = route;

  switch (name) {
    case 'form':
      renderFormScreen(root);
      break;
    case 'map':
      renderMapScreen(root, Number(params[0]) === 5 ? 5 : 4);
      break;
    case 'soon':
      renderComingSoonScreen(root, params[0]);
      break;
    case 'lesson':
      renderLessonScreen(root, params[0], params[1]);
      break;
    case 'practice':
      renderPracticeScreen(root, params[0]);
      break;
    case 'start':
    default:
      renderStartScreen(root);
      break;
  }

  root.scrollTop = 0;
  window.scrollTo(0, 0);
}

onRouteChange(render);
startRouter();
