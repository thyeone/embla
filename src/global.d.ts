type PropsWithStrictChildren<P = unknown, T extends React.ReactNode = ReactNode> = P & {
  children: T;
};
