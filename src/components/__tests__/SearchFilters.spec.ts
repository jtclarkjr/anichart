import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Select } from '@jtclarkjr/component-library-vue'
import type { ConcreteComponent } from 'vue'
import SearchFilters from '../search/SearchFilters.vue'
import { MediaSeason, MediaSort } from '@/utils/types/anilist'

// Vue Test Utils cannot currently instantiate the package's generic Select SFC type.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const ConcreteSelect = Select as unknown as ConcreteComponent

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

  it('updates a package-backed select and signals a filter change once', async () => {
    const wrapper = mount(SearchFilters, { props: createProps('') })
    const [sortSelect] = wrapper.findAllComponents(ConcreteSelect)

    sortSelect?.vm.$emit('update:modelValue', MediaSort.SCORE_DESC)
    await nextTick()

    expect(wrapper.emitted('update:selectedSort')).toEqual([[MediaSort.SCORE_DESC]])
    expect(wrapper.emitted('filterChange')).toEqual([[]])
  })
})
