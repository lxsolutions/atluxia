





import click
from .commands import job, status, logs, withdraw

@click.group()
def main():
    """OpenGrid CLI for decentralized compute mesh."""
    pass

main.add_command(job.submit)
main.add_command(status.status)
main.add_command(logs.logs)
main.add_command(withdraw.withdraw)

if __name__ == "__main__":
    main()

