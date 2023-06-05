import type { BytesLike } from '@ethersproject/bytes';
import type {
  FunctionFragment,
  JsonFlatAbi,
  JsonFlatAbiFragmentArgumentType,
  JsonFlatAbiFragmentFunction,
  InferAbiType,
  TupleToUnion,
} from '@fuel-ts/abi-coder';
import type { AbstractAddress, AbstractProgram } from '@fuel-ts/interfaces';
import type { BigNumberish } from '@fuel-ts/math';
import type { CoinQuantityLike, CoinQuantity } from '@fuel-ts/providers';

import type { FunctionInvocationScope } from './functions/invocation-scope';

export type InvocationScopeLike<T = unknown> = {
  getCallConfig(): CallConfig<T>;
};

export type TransactionCostOptions = Partial<{
  fundTransaction: boolean;
  gasPrice: BigNumberish;
  tolerance: number;
}>;

export type ContractCall = {
  contractId: AbstractAddress;
  data: BytesLike;
  fnSelector: string;
  isDataPointer: boolean;
  amount?: BigNumberish;
  assetId?: BytesLike;
  gas?: BigNumberish;
};

export type CallParams = Partial<{
  forward: CoinQuantityLike;
  gasLimit: BigNumberish;
}>;

// #region transaction-params
export type TxParams = Partial<{
  gasPrice: BigNumberish;
  gasLimit: BigNumberish;
  variableOutputs: number;
}>;
// #endregion transaction-params

export type CallOptions = Partial<{
  fundTransaction: boolean;
}>;

export type CallConfig<T = unknown> = {
  func: FunctionFragment;
  program: AbstractProgram;
  callParameters?: CallParams;
  txParameters?: TxParams;
  forward?: CoinQuantity;
  args: T;
  bytesOffset: number;
};

export type InvokeFunctions<
  Fn extends JsonFlatAbiFragmentFunction,
  Types extends JsonFlatAbi['types']
> = {
  [Name in Fn['name']]: Fn extends { readonly name: Name } ? InvokeFunction<Fn, Types> : never;
};

type InvokeFunction<
  Fn extends JsonFlatAbiFragmentFunction,
  Types extends JsonFlatAbi['types'],
  TArgs extends Array<unknown> = Array<unknown>,
  TReturn = InferAbiType<Types, Fn['output']>,
  FnInput extends JsonFlatAbiFragmentArgumentType = TupleToUnion<Fn['inputs']>
> = Fn['inputs']['length'] extends 0
  ? () => FunctionInvocationScope<never, TReturn>
  : (
      input: {
        // do not abstract into some FunctionInputs<...> type because it makes the
        // displayed inferred on-hover type ugly
        [InputName in FnInput['name']]: FnInput extends { readonly name: InputName }
          ? InferAbiType<Types, FnInput>
          : never;
      },
      ...args: TArgs
    ) => FunctionInvocationScope<TArgs, TReturn>;
