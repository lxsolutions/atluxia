






import click
import yaml

@click.command()
@click.argument('job_file', type=click.Path(exists=True))
def submit(job_file):
    """Submit a job to the OpenGrid network."""
    try:
        with open(job_file, 'r') as f:
            job_spec = yaml.safe_load(f)

        click.echo(f"Submitting job: {job_spec['name']}")
        # In a real implementation, we would send this to the coordinator API

        click.echo("Job submitted successfully!")
    except Exception as e:
        click.echo(f"Error submitting job: {e}", err=True)



