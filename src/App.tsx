import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import ExplainSidebar from './components/ExplainSidebar';
import { usePdfStore } from './stores/pdfStore';

export default function App() {
  const pdfUrl = usePdfStore((s) => s.pdfUrl);

  return (
    <Layout>
      {pdfUrl ? (
        <>
          {/* PDF takes remaining width; sidebar is fixed-width on desktop */}
          <PDFViewer />
          <ExplainSidebar />
        </>
      ) : (
        <FileUpload />
      )}
    </Layout>
  );
}
