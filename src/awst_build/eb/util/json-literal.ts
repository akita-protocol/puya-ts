import { BoolConstant, StringConstant } from '../../../awst/nodes'
import type { SourceLocation } from '../../../awst/source-location'
import { CodeError } from '../../../errors'
import { codeInvariant } from '../../../util'
import { boolPType, stringPType } from '../../ptypes'
import type { NodeBuilder } from '../index'
import { ArrayLiteralExpressionBuilder } from '../literal/array-literal-expression-builder'
import { NumericLiteralExpressionBuilder } from '../literal/numeric-literal-expression-builder'
import { ObjectLiteralExpressionBuilder } from '../literal/object-literal-expression-builder'
import { requestConstantOfType } from './index'

export type JsonValue = string | number | boolean | JsonValue[] | { [key: string]: JsonValue }

/**
 * Evaluates a compile-time literal (objects, arrays, strings, numbers and booleans, nested to any depth)
 * into a JSON value, for metadata that is copied verbatim into the ARC-56 output.
 */
export function requireJsonLiteral(builder: NodeBuilder, sourceLocation: SourceLocation): JsonValue {
  if (builder instanceof ObjectLiteralExpressionBuilder) {
    const result: { [key: string]: JsonValue } = {}
    for (const { name } of builder.ptype.properties) {
      result[name] = requireJsonLiteral(builder.memberAccess(name, builder.sourceLocation), sourceLocation)
    }
    return result
  }
  if (builder instanceof ArrayLiteralExpressionBuilder) {
    return builder.ptype.items.map((_, index) =>
      requireJsonLiteral(builder.indexAccess(BigInt(index), builder.sourceLocation), sourceLocation),
    )
  }
  if (builder instanceof NumericLiteralExpressionBuilder) {
    codeInvariant(
      builder.value <= BigInt(Number.MAX_SAFE_INTEGER) && builder.value >= BigInt(Number.MIN_SAFE_INTEGER),
      'Numbers in metadata literals must be safe integers; use a string for larger values',
      builder.sourceLocation,
    )
    return Number(builder.value)
  }
  const str = requestConstantOfType(builder, stringPType)
  if (str instanceof StringConstant) return str.value
  const bool = requestConstantOfType(builder, boolPType)
  if (bool instanceof BoolConstant) return bool.value
  throw new CodeError('Metadata literals may only contain string, number and boolean literals, arrays and objects', {
    sourceLocation: builder.sourceLocation ?? sourceLocation,
  })
}

/** Evaluates a compile-time object literal into compact JSON text. */
export function requireJsonObjectLiteral(builder: NodeBuilder, sourceLocation: SourceLocation): string {
  codeInvariant(builder instanceof ObjectLiteralExpressionBuilder, 'Expected an object literal', builder.sourceLocation ?? sourceLocation)
  return JSON.stringify(requireJsonLiteral(builder, sourceLocation))
}
