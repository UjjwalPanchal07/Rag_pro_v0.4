from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes   import router as auth_router
from app.routes.admin_routes  import router as admin_router
from app.routes.upload_routes import router as upload_router
from app.routes.query_routes  import router as query_router
from app.routes.batch_routes  import router as batch_router
from app.routes.rfp_routes    import router as rfp_router
from app.routes.health_routes import router as health_router
from app.routes.web_routes    import router as web_router
from app.db import seed_default_admin

app = FastAPI(title="PRISM API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(upload_router)
app.include_router(query_router)
app.include_router(batch_router)
app.include_router(rfp_router)
app.include_router(web_router)


@app.on_event("startup")
def on_startup():
    seed_default_admin()
