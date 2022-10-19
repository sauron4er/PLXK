import newDocStore from '../new_doc_store';
import {notify} from 'templates/components/my_extras';

export const areArticlesValid = () => {
  const {decree_articles} = newDocStore.new_document;
  
  if (!decree_articles.length) {
    notify("Потрібно додати хоча б один пункт");
    return false;
  }
  
  for (const article of decree_articles) {
    if (!article.text) {
      notify("Потрібно заповнити поле \"Текст\" у всіх пунктах");
      return false;
    } else if (!article.responsibles.length) {
      notify("Потрібно обрати відповідальних у всіх пунктах");
      return false;
    } else if (article.term === 'term' && !article.deadline) {
      notify("Потрібно обрати термін у пунктах зі строком виконання");
      return false;
    }
  }
  
  return true;
};
