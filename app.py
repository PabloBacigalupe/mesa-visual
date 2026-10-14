"""Optional Streamlit entry point. Run: streamlit run app.py --server.address 127.0.0.1"""
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components
from server import start_server

st.set_page_config(page_title="Mesa Visual · Estudio editorial", layout="wide", initial_sidebar_state="collapsed")


@st.cache_resource
def backend():
    return start_server(port=0, root=Path(__file__).parent)


http_server, _engine = backend()
st.markdown("<style>.block-container{padding:0;max-width:none}header[data-testid=stHeader]{display:none}</style>", unsafe_allow_html=True)
components.iframe(f"http://127.0.0.1:{http_server.server_port}", height=1900, scrolling=True)
st.caption("Aplicación local. Mantén Streamlit abierto durante la generación.")
