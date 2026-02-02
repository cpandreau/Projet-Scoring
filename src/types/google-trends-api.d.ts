declare module 'google-trends-api' {
  interface InterestOverTimeOptions {
    keyword: string | string[]
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
    timezone?: number
    category?: number
  }

  interface RelatedQueriesOptions {
    keyword: string | string[]
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
    timezone?: number
    category?: number
  }

  interface RelatedTopicsOptions {
    keyword: string | string[]
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
    timezone?: number
    category?: number
  }

  interface InterestByRegionOptions {
    keyword: string | string[]
    startTime?: Date
    endTime?: Date
    geo?: string
    resolution?: string
    hl?: string
    timezone?: number
    category?: number
  }

  function interestOverTime(options: InterestOverTimeOptions): Promise<string>
  function relatedQueries(options: RelatedQueriesOptions): Promise<string>
  function relatedTopics(options: RelatedTopicsOptions): Promise<string>
  function interestByRegion(options: InterestByRegionOptions): Promise<string>
  function dailyTrends(options: { geo: string; trendDate?: Date; hl?: string }): Promise<string>
  function realTimeTrends(options: { geo: string; category?: string; hl?: string }): Promise<string>

  export {
    interestOverTime,
    relatedQueries,
    relatedTopics,
    interestByRegion,
    dailyTrends,
    realTimeTrends,
  }

  const googleTrends: {
    interestOverTime: typeof interestOverTime
    relatedQueries: typeof relatedQueries
    relatedTopics: typeof relatedTopics
    interestByRegion: typeof interestByRegion
    dailyTrends: typeof dailyTrends
    realTimeTrends: typeof realTimeTrends
  }

  export default googleTrends
}
