// This file is auto-generated, do not modify
/* eslint-disable */
import type { arc4 } from '@algorandfoundation/algorand-typescript'
import { Contract, abimethod, err } from '@algorandfoundation/algorand-typescript'

export abstract class RaffleUi extends Contract {
  @abimethod()
  enter(tickets: arc4.Uint<64>): arc4.Uint<64> {
    err('stub only')
  }

  @abimethod({ readonly: true })
  price(): arc4.Uint<64> {
    err('stub only')
  }
}
