import { getAllContent, sortByDate, getAllTags } from '@/lib/content'
import NewsClient from './news-client'

export default function NewsPage() {
  const articles = sortByDate(getAllContent('news'))
  const tags = getAllTags(articles)
  
  return <NewsClient articles={articles} tags={tags} />
}