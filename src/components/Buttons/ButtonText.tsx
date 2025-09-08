import { Text, Field, withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

type ButtonTextProps = ComponentProps & {
  fields: {
    heading: Field<string>;
  };
};

const ButtonText = (props: ButtonTextProps): JSX.Element => (
  <div>
    <p>ButtonText Component</p>
    <Text field={props.fields.heading} />
  </div>
);

export default withDatasourceCheck()<ButtonTextProps>(ButtonText);
