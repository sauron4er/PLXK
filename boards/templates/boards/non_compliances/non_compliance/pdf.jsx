'use strict';
import * as React from 'react';
import {PDFViewer, Document, Page, Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  header: {
    borderBottom: '0.5px',
    alignItems: 'center',
    flexDirection: 'row'
  },
  first_phase: {},
  second_phase: {},
  third_phase: {},
  text: {
    fontFamily: 'Roboto'
  }
});

class NCPDF extends React.Component {
  render() {
    return (
      <PDFViewer style={{width: '100%', height: '100%'}}>
        <Document>
          <Page size='A4' style={styles.page}>
            <View style={styles.header}>
              <Text style={[styles.text, {flexBasis: '20%', borderRight: '0.5px', textAlign: 'center'}]}>1</Text>
              <Text style={[styles.text, {flexBasis: '60%', textAlign: 'center'}]}>
                <Text>АКТ НЕВІДПОВІДНОСТІ</Text>
                <Text>NON-CONFORMITY REGISTRATION ACT</Text>
              </Text>
              <Text style={[styles.text, {flexBasis: '20%', borderLeft: '0.5px', textAlign: 'center'}]}>2</Text>
            </View>
            <View style={styles.first_phase}>
              <Text>Section #1</Text>
            </View>
            <View style={styles.second_phase}>
              <Text>Section #2</Text>
            </View>
            <View style={styles.third_phase}>
              <Text>Section #3</Text>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    );
  }
}

export default view(NCPDF);
