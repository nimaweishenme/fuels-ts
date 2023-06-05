import type { TupleToUnion } from 'type-fest';

import type {
  JsonFlatAbi,
  JsonFlatAbiFragmentArgumentType,
  JsonFlatAbiFragmentType,
} from './json-abi';
import type { IndexOf, ReplaceValues } from './utilities';

export type InferAbiType<
  Types extends JsonFlatAbi['types'],
  Arg extends JsonFlatAbiFragmentArgumentType,
  // The @ts-ignore below is because of some null incompatibility
  // I couldn't get down to the root of it, but everything works nonetheless
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Components extends JsonFlatAbiFragmentType['components'] = MapComponents<Types, Arg>,
  T extends JsonFlatAbiFragmentType = Types[Arg['type']],
  TType extends string = T['type'],
  C extends JsonFlatAbiFragmentArgumentType = TupleToUnion<NonNullable<Components>>
> = TType extends AbiBuiltInType
  ? MapAbiBuiltInType<TType>
  : TType extends 'struct Vec'
  ? InferAbiType<Types, NonNullable<Components>[0]>[]
  : TType extends 'struct RawVec'
  ? InferAbiType<Types, NonNullable<Arg['typeArguments']>[0]>
  : TType extends `enum ${string}`
  ? MapAbiEnum<Types, Components>
  : TType extends `(_,${string}_)`
  ? MapAbiTuple<Types, Components>
  : TType extends `struct ${string}`
  ? {
      // Do not abstract away into a MapAbiStruct<...> type
      // Because it makes the inferred type look ugly on mouse hover over argument
      [Name in C['name']]: C extends { readonly name: Name } ? InferAbiType<Types, C> : never;
    }
  : TType extends `[_; ${infer Length extends number}]`
  ? MapAbiArray<Types, Length, Components>
  : T | 'My man, you should know this type!';

type MapComponents<
  Types extends JsonFlatAbi['types'],
  Arg extends JsonFlatAbiFragmentArgumentType,
  T extends JsonFlatAbiFragmentType = Types[Arg['type']],
  Components extends NonNullable<JsonFlatAbiFragmentType['components']> = NonNullable<
    T['components']
  >,
  TypeParameterArgsMap extends Record<number, JsonFlatAbiFragmentArgumentType> = {
    [GenericId in TupleToUnion<T['typeParameters']>]: NonNullable<Arg['typeArguments']>[IndexOf<
      T['typeParameters'],
      GenericId
    >];
  }
> = T['components'] extends null
  ? null
  : T['typeParameters'] extends null
  ? Components
  : {
      readonly [K in keyof Components]: Components[K]['type'] extends keyof TypeParameterArgsMap
        ? ReplaceValues<Components[K], Omit<TypeParameterArgsMap[Components[K]['type']], 'name'>>
        : Components[K]['typeArguments'] extends null
        ? Components[K]
        : ReplaceValues<
            Components[K],
            {
              readonly typeArguments: MapTypeArguments<
                NonNullable<Components[K]['typeArguments']>,
                TypeParameterArgsMap
              >;
            }
          >;
    };

type MapTypeArguments<
  Args extends readonly JsonFlatAbiFragmentArgumentType[],
  TypeParameterArgsMap extends Record<number, JsonFlatAbiFragmentArgumentType>
> = {
  [K in keyof Args]: ReplaceValues<
    Args[K],
    Args[K]['type'] extends keyof TypeParameterArgsMap
      ? Pick<TypeParameterArgsMap[Args[K]['type']], 'type' | 'typeArguments'>
      : {
          readonly typeArguments: Args[K]['typeArguments'] extends null
            ? Args[K]
            : MapTypeArguments<NonNullable<Args[K]['typeArguments']>, TypeParameterArgsMap>;
        }
  >;
};

type AbiBuiltInType = '()' | 'u8' | 'u16' | 'u32' | 'u64' | 'b256' | 'bool' | `str[${number}]`;

type MapAbiBuiltInType<T extends AbiBuiltInType> = T extends 'u8' | 'u16' | 'u32' | 'u64'
  ? number
  : T extends `str[${string}]`
  ? // ? StringOfLength<Input extends string ? Input : never, R>
    string
  : T extends 'b256'
  ? string
  : T extends 'bool'
  ? boolean
  : T extends '()'
  ? void
  : never;

type MapAbiArray<
  Types extends JsonFlatAbi['types'],
  Length extends number,
  Components extends JsonFlatAbiFragmentType['components'],
  ElementArg extends JsonFlatAbiFragmentArgumentType = NonNullable<Components>[0]
> = CreateTsTuple<Length, InferAbiType<Types, ElementArg>>;

type CreateTsTuple<L extends number, T, R extends T[] = []> = R['length'] extends L
  ? R
  : CreateTsTuple<L, T, [...R, T]>;

type MapAbiTuple<
  Types extends JsonFlatAbi['types'],
  Components extends JsonFlatAbiFragmentType['components'],
  ComponentsArr extends readonly JsonFlatAbiFragmentArgumentType[] = NonNullable<Components>
> = {
  -readonly [K in keyof ComponentsArr]: InferAbiType<Types, ComponentsArr[K]>;
};

type MapAbiEnum<
  Types extends JsonFlatAbi['types'],
  Components extends JsonFlatAbiFragmentType['components'],
  Component extends JsonFlatAbiFragmentArgumentType = TupleToUnion<NonNullable<Components>>
> = Types[Component['type']]['type'] extends '()'
  ? Component['name']
  : InferAbiType<Types, Component>;
