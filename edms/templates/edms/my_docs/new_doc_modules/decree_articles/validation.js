import decreeArticlesStore from "edms/templates/edms/my_docs/new_doc_modules/decree_articles/store";
import {notify} from 'templates/components/my_extras';

export const areArticlesValid = () => {
  const {decree_articles} = decreeArticlesStore;
  const not_deleted = responsible => responsible.status !== 'delete'
  
  if (!decree_articles.length) {
    notify("Потрібно додати хоча б один пункт");
    return false;
  }
  
  for (const article of decree_articles) {
    if (!article.text) {
      notify("Потрібно заповнити поле \"Текст\" у всіх пунктах");
      return false;
    } else if (!article.responsibles.length || !article.responsibles.some(not_deleted)) {
      notify("Потрібно обрати відповідальних у всіх пунктах");
      return false;
    } else if (article.term === 'term' && !article.deadline) {
      notify("Потрібно обрати термін у пунктах зі строком виконання");
      return false;
    }
  }
  
  return true;
};
