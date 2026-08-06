import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import { MediaSeason, MediaSort } from '@/utils/types/anilist'

if (typeof window !== 'undefined') {
  window['__ENV__'] ??= { ANILIST_API_URL: 'https://graphql.anilist.co' }
}

const { default: SearchFilters } = await import('./SearchFilters.vue')

const meta = {
  title: 'Search/SearchFilters',
  component: SearchFilters,
  args: {
    searchQuery: '',
    selectedSort: MediaSort.POPULARITY_DESC,
    selectedSeason: MediaSeason.SUMMER
  },
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { SearchFilters },
    setup() {
      const searchQuery = ref(args.searchQuery)
      const selectedSort = ref(args.selectedSort)
      const selectedSeason = ref(args.selectedSeason)
      const filterChanges = ref(0)

      return { filterChanges, searchQuery, selectedSeason, selectedSort }
    },
    template: `
      <div style="width: min(68rem, calc(100vw - 3rem))">
        <SearchFilters
          v-model:search-query="searchQuery"
          v-model:selected-sort="selectedSort"
          v-model:selected-season="selectedSeason"
          @filter-change="filterChanges += 1"
        />
        <output data-testid="filter-state">
          {{ searchQuery }}|{{ selectedSort }}|{{ selectedSeason }}|{{ filterChanges }}
        </output>
      </div>
    `
  })
} satisfies Meta<typeof SearchFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Integration: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const search = canvas.getByRole('searchbox', { name: 'Search anime' })

    await userEvent.type(search, 'Cowboy Bebop')
    await expect(search).toHaveValue('Cowboy Bebop')
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    await expect(search).toHaveValue('')

    const [sort] = canvas.getAllByRole('combobox')
    await userEvent.click(sort)
    await userEvent.click(await page.findByRole('option', { name: 'Top Rated' }))

    await expect(sort).toHaveTextContent('Top Rated')
    await expect(canvas.getByTestId('filter-state')).toHaveTextContent(
      `|${MediaSort.SCORE_DESC}|${MediaSeason.SUMMER}|2`
    )
  }
}
