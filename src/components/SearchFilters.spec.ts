import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchFilters from './SearchFilters.vue'
import { MediaSeason, MediaSort } from '@/utils/types/anilist'

const createProps = (searchQuery: string) => ({
  searchQuery,
  selectedSort: MediaSort.POPULARITY_DESC,
  selectedSeason: MediaSeason.SUMMER
})

describe('SearchFilters', () => {
  it('shows the clear button only when the search input is filled', async () => {
    const wrapper = mount(SearchFilters, { props: createProps('') })

    expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(false)

    await wrapper.setProps({ searchQuery: 'Cowboy Bebop' })

    expect(wrapper.get('button[aria-label="Clear search"]')).toBeTruthy()
  })

  it('clears the search and signals a filter change', async () => {
    const wrapper = mount(SearchFilters, { props: createProps('Cowboy Bebop') })

    await wrapper.get('button[aria-label="Clear search"]').trigger('click')

    expect(wrapper.emitted('update:searchQuery')).toEqual([['']])
    expect(wrapper.emitted('filterChange')).toEqual([[]])
  })
})
