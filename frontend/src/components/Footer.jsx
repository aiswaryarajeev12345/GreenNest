export default function Footer() {
  return (
    <footer className="gn-footer">
      <div className="gn-container gn-footer-inner">
        <p className="gn-footer-brand">GreenNest – Grow. Share. Connect.</p>
        <p className="gn-footer-copy">© {new Date().getFullYear()} GreenNest. All rights reserved.</p>
      </div>
    </footer>
  );
}
