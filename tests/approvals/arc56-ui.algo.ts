import type { uint64 } from '@algorandfoundation/algorand-typescript'
import { Contract, contract, GlobalState } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'

@contract({
  ui: { glyph: 'Ticket', color: '#14b8a6', defaultAction: 'raffle_enter' },
})
export class RaffleUi extends Contract {
  ticketPrice = GlobalState<uint64>({ initialValue: 1_000_000 })
  endTimestamp = GlobalState<uint64>({ initialValue: 0 })

  @abimethod({
    ui: {
      action: 'raffle_enter',
      glyph: 'Ticket',
      label: 'Enter raffle',
      card: {
        show: [
          { label: 'Ticket price', from: { source: 'global', data: 'ticketPrice' }, format: 'amount' },
          { label: 'Ends', from: { source: 'global', data: 'endTimestamp' }, format: 'time' },
        ],
        bind: { tickets: { input: 'count', label: 'Tickets', min: 1 } },
        pay: { amount: { mul: [{ source: 'global', data: 'ticketPrice' }, { arg: 'tickets' }] } },
        enabled: { before: { source: 'global', data: 'endTimestamp' } },
        confirm: 'Enter with {tickets} tickets?',
      },
    },
  })
  enter(tickets: uint64): uint64 {
    return tickets
  }

  @abimethod({ readonly: true, ui: { action: 'raffle_view', glyph: 'Eye' } })
  price(): uint64 {
    return this.ticketPrice.value
  }
}
